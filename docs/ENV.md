# Python Environment & Package Pins

Always use `.venv` with Python 3.11 (`/opt/homebrew/bin/python3.11`) and install via `pip install -r requirements.lock.txt`.
Pins are required to keep `pip check` clean and ensure MCP servers and FastAPI boot reliably:
- `mcp==1.30.0` (`<2`): Required by `mcps/sandbox/mcp_server.py` (`@server.list_tools()`) and `langchain_mcp_adapters` tools imports, both removed in `mcp>=2.0`.
- `pydantic==2.13.5` (`<2.14`): Prevents `TypeError: cannot specify both default and default_factory` triggered by `fastmcp` under `pydantic>=2.14`.
- `fastmcp==2.14.7` (`<3`): Satisfies `fastmcp>=2.0.0` while maintaining compatibility with `mcp<2.0.0` and Python 3.11.

## Setup Instructions
```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.lock.txt
```
