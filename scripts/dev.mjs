import { spawn } from 'node:child_process'

const services = [
  {
    label: 'backend',
    command: 'python',
    args: ['-m', 'daphne', '-b', '0.0.0.0', '-p', '8000', 'config.asgi:application'],
    cwd: new URL('../back/', import.meta.url),
  },
  {
    label: 'stream',
    command: 'python',
    args: ['manage.py', 'run_market_stream'],
    cwd: new URL('../back/', import.meta.url),
  },
  {
    label: 'frontend',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: new URL('../front/', import.meta.url),
  },
]

const children = services.map((service) => {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    shell: true,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${service.label}] exited with code ${code ?? 'unknown'}`)
    }
  })

  return child
})

function shutdown(signal) {
  for (const child of children) {
    child.kill(signal)
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
