"""Hardened Docker sandbox runner for Pactline.

Uses the docker CLI via subprocess (no extra dependencies).
"""

import os
import shutil
import subprocess
from typing import List, Optional, Union

def _get_docker_bin() -> str:
    docker_bin = shutil.which("docker")
    if not docker_bin:
        for candidate in ["/usr/local/bin/docker", "/opt/homebrew/bin/docker", os.path.expanduser("~/.docker/bin/docker")]:
            if os.path.exists(candidate) and os.access(candidate, os.X_OK):
                return candidate
        return "docker"
    return docker_bin


def is_docker_available() -> bool:
    docker_bin = _get_docker_bin()
    try:
        res = subprocess.run([docker_bin, "info"], capture_output=True, timeout=5)
        return res.returncode == 0
    except Exception:
        return False


def create_sandbox(run_id: str, image: str = "sandbox-python:latest") -> str:
    docker_bin = _get_docker_bin()
    short_id = run_id[:8]
    container_name = f"pactline-sbx-{short_id}"

    # Hardening flags per spec
    cmd = [
        docker_bin,
        "run",
        "-d",
        "--name",
        container_name,
        "--label",
        "pactline=1",
        "--network",
        "none",
        "--memory",
        "512m",
        "--memory-swap",
        "512m",
        "--cpus",
        "1",
        "--pids-limit",
        "256",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        image,
    ]

    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return container_name


def copy_in(name: str, host_path: str, container_path: str) -> None:
    docker_bin = _get_docker_bin()
    cmd = [docker_bin, "cp", host_path, f"{name}:{container_path}"]
    subprocess.run(cmd, capture_output=True, text=True, check=True)


def exec(name: str, cmd: Union[str, List[str]], timeout: int = 30) -> subprocess.CompletedProcess:
    docker_bin = _get_docker_bin()
    docker_cmd = [docker_bin, "exec", name]
    if isinstance(cmd, str):
        docker_cmd.extend(["bash", "-c", cmd])
    else:
        docker_cmd.extend(cmd)

    return subprocess.run(docker_cmd, capture_output=True, text=True, timeout=timeout)


def copy_out(name: str, container_path: str, host_path: str) -> None:
    docker_bin = _get_docker_bin()
    cmd = [docker_bin, "cp", f"{name}:{container_path}", host_path]
    subprocess.run(cmd, capture_output=True, text=True, check=True)


def destroy(name: str) -> None:
    docker_bin = _get_docker_bin()
    cmd = [docker_bin, "rm", "-f", name]
    subprocess.run(cmd, capture_output=True, text=True)


def cleanup_all() -> None:
    docker_bin = _get_docker_bin()
    # Remove containers strictly by label pactline=1 (never by name prefix)
    list_cmd = [docker_bin, "ps", "-aq", "--filter", "label=pactline=1"]
    res = subprocess.run(list_cmd, capture_output=True, text=True)
    cids = res.stdout.strip().split()
    if cids:
        rm_cmd = [docker_bin, "rm", "-f"] + cids
        subprocess.run(rm_cmd, capture_output=True, text=True)
