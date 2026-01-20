#!/bin/bash
# wait-for-it.sh
# Wait for a TCP service to become available
# Usage: ./wait-for-it.sh host:port [command]

TIMEOUT=15
QUIET=0

echoerr() {
  if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi
}

usage() {
  exitcode=$1
  cat << USAGE >&2
Usage:
  $0 host:port [-t timeout] [-- command args]
  -t TIMEOUT            Timeout in seconds, zero for no timeout
  -q, --quiet          Don't output any status messages
  -- COMMAND ARGS      Execute command with args after the test finishes
USAGE
  exit $exitcode
}

wait_for() {
  for i in `seq $TIMEOUT` ; do
    nc -z "$HOST" "$PORT" > /dev/null 2>&1
    
    result=$?
    if [[ $result -eq 0 ]] ; then
      if [[ $# -gt 0 ]] ; then
        exec "$@"
      fi
      exit 0
    fi
    
    if [[ $TIMEOUT -gt 0 ]] ; then
      TIMEOUT=$((TIMEOUT - 1))
      echoerr "Waiting for $HOST:$PORT... ($TIMEOUT seconds left)"
    fi
    
    sleep 1
  done
  
  echoerr "Operation timed out"
  exit 1
}

while [[ $# -gt 0 ]]
do
  case "$1" in
    *:* )
    HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
    PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
    shift 1
    ;;
    -t )
    TIMEOUT="$2"
    if [[ $TIMEOUT == "" ]]; then break; fi
    shift 2
    ;;
    -q | --quiet )
    QUIET=1
    shift 1
    ;;
    -- )
    shift
    wait_for "$@"
    ;;
    -h )
    usage 0
    ;;
    * )
    echoerr "Unknown argument: $1"
    usage 1
    ;;
  esac
done

wait_for
