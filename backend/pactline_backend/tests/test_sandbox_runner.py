import os
import sys
import tempfile
import pytest

from backend.pactline_backend.sandbox import (
    is_docker_available,
    create_sandbox,
    copy_in,
    exec,
    copy_out,
    destroy,
    cleanup_all,
)

pytestmark = pytest.mark.skipif(
    not is_docker_available(),
    reason="Docker is not available/running on host system",
)

def test_sandbox_lifecycle_and_smoke():
    cleanup_all()
    run_id = "test_run_0123456789"
    name = create_sandbox(run_id)
    try:
        assert name == f"pactline-sbx-{run_id[:8]}"

        # 1. pandas and numpy import
        res_import = exec(name, "python3 -c 'import pandas, numpy; print(\"OK\")'")
        assert res_import.returncode == 0
        assert "OK" in res_import.stdout

        # 2. typst --version works
        res_typst = exec(name, "typst --version")
        assert res_typst.returncode == 0
        assert "typst" in res_typst.stdout.lower()

        # 3. network is blocked
        res_net = exec(name, "python3 -c 'import urllib.request; urllib.request.urlopen(\"http://1.1.1.1\", timeout=2)'")
        assert res_net.returncode != 0

        # 4. /workspace/outputs exists
        res_dir = exec(name, "test -d /workspace/outputs && echo exists")
        assert "exists" in res_dir.stdout

        # 5. file copied in is readable and file written there can be copied out
        with tempfile.NamedTemporaryFile("w+", delete=False) as tf_in:
            tf_in.write("pactline-test-payload")
            tf_in_path = tf_in.name
        os.chmod(tf_in_path, 0o644)

        with tempfile.NamedTemporaryFile("w+", delete=False) as tf_out:
            tf_out_path = tf_out.name

        try:
            copy_in(name, tf_in_path, "/workspace/outputs/test_in.txt")
            res_read = exec(name, "cat /workspace/outputs/test_in.txt")
            assert res_read.returncode == 0
            assert "pactline-test-payload" in res_read.stdout

            exec(name, "echo 'pactline-test-output' > /workspace/outputs/test_out.txt")
            copy_out(name, "/workspace/outputs/test_out.txt", tf_out_path)
            with open(tf_out_path, "r") as f:
                content = f.read()
            assert "pactline-test-output" in content
        finally:
            if os.path.exists(tf_in_path):
                os.remove(tf_in_path)
            if os.path.exists(tf_out_path):
                os.remove(tf_out_path)

        # 6. REPL daemon check via SandboxManager
        sys.path.insert(0, os.path.abspath("mcps/sandbox"))
        try:
            from sandbox import SandboxManager
            sm = SandboxManager()
            cell_res = sm.execute_cell(name, "print(2+2)")
            assert "4" in cell_res
        except Exception as e:
            pytest.fail(f"REPL daemon execute_cell failed: {e}")

    finally:
        destroy(name)
        cleanup_all()
