import subprocess
import sys

def run_command(args):
    """Executes a command securely using list-based arguments and shell=False."""
    try:
        # SECURITY: args is a list, shell=False prevents shell injection.
        # Codacy flags use of non-literal lists in subprocess.run.
        # We ensure it is a list of strings.
        cmd = [str(arg) for arg in args]
        result = subprocess.run(cmd, shell=False, check=False, capture_output=True, text=True) # nosec
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        if args and args[0] != 'which':
            print(f"Error executing command: {e}", file=sys.stderr)
        return None
