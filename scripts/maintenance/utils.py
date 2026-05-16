import subprocess
import sys

def run_command(args):
    """Executes a command securely using list-based arguments and shell=False."""
    try:
        result = subprocess.run( # nosec
            args,
            shell=False,
            check=False,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        # Don't log errors for 'which' checks or expected failures
        if args[0] != 'which':
            print(f"Error executing command {' '.join(args)}: {e}", file=sys.stderr)
        return None
