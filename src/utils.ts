import { readFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const configPath = path.join(os.homedir(), '.skaiorc')

const client = new Client({
  name:'',
  version:''
})

function runCommand(name:string, ...args:string[]) {
  return new Promise((resolve, reject) => {
    const tail = spawn(name, args)
    
    let output = ''
    let error = ''

    tail.stdout.on('data', data=>output+=data.toString())
    tail.stderr.on('data', data=>error+=data.toString())
    tail.on('close', code=>code === 0 ? resolve(output) : reject(error))
  })
}

async function getAvailableTools() {
  const content = await readFile(configPath, 'utf-8')
  const config = JSON.parse(content)
  const mcpServers = config['mcpServers']

  for (const name of Object.keys(mcpServers)) {
    const { command, args, env } = mcpServers[name]
    const transport = new StdioClientTransport({ command, args, env })
    await client.connect(transport)
  }

  const { tools } = await client.listTools()

  console.log(tools)

  // const result = await runCommand('uvx', 'mcp-server-time', '--local-timezone=Asia/Shanghai')

  // console.log(mcpServers)
  // console.log(result)

  await client.close()
}

getAvailableTools()

