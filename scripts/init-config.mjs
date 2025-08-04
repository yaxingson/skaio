import { writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as dotenv from 'dotenv'

dotenv.config()

const configPath = path.join(os.homedir(), '.skaiorc')

const config = {
  registry:'https://mcp.so',
  mcpServers:{
    everart:{
      command:'npx',
      args:['-y', '@modelcontextprotocol/server-everart'],
      env:{
        EVERART_API_KEY: process.env['EVERART_API_KEY']
      }
    },
    'howtocook-mcp':{
      command:'npx',
      args:['-y', 'howtocook-mcp']
    }
  }
}

async function init() {
  try {
    await writeFile(configPath, JSON.stringify(config, null, 2))
  } catch {

  }

}

init()
