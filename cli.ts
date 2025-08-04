import minimist from 'minimist'
import { readFile } from 'node:fs/promises'
import util from 'node:util'
import { createInterface } from 'node:readline/promises'
import { version } from './package.json'
import { OpenAI } from 'openai'
import * as dotenv from 'dotenv'

dotenv.config({ quiet:true })

const client = new OpenAI()

const r1 = createInterface({ 
  input:process.stdin, 
  output:process.stdout,
  terminal:false,
})

const available_models = [
  {
    name:'gpt-3.5-turbo',
    provider:'openai',
  },
  {
    name:'claude-3-5-sonnet',
    provider:'anthropic',
  },
  {
    name:'gemini-2.5-pro',
    provider:'google',
  },
  {
    name:'qwen-plus',
    provider:'alibaba',
  },
  {
    name:'glm-4-flash',
    provider:'zhipu',
  },
]

const options = [
  {
    name:'--version',
    alias: '-v',
    description:'Display the current version number of skaio (also -v).'
  },
  {
    name:'--help',
    alias:'-h',
    description:'Display skaio help information.'
  }
]

const subCommands = [
  {
    name:'list',
    description:'List the currently available large language models and their providers.',
    action() {
      console.log('\n' + available_models.map(model=>`${model.name.padEnd(20, ' ')}${model.provider}`).join('\n'))
    }
  },
  {
    name:'use',
    description:'Switch to using the specified language model.',
    arguments:['<model>'],
    options:[
      {
        name:'--interactive',
        alias:'-i',
        description:'Enable the interactive dialogue mode.'
      }
    ],
    async action(model:string, options:{ interactive?:boolean }) {
      const { interactive=false } = options
      
      if (interactive) {
        while (true) {
          const userInput = await r1.question('>>> ')
          if (/^(quit|exit)$/.test(userInput)) {
            r1.close()
            break
          }
          const res = await chat(model, userInput)
          console.log(res)
        }
      }
    }
  }
]

const helpInfo = `
Running version ${version}.

Usage: skaio <command> [options]

Options:

${options.map(opt=>`${opt.alias}, ${opt.name}`.padEnd(20, ' ') + opt.description).join('\n')}

Commands:

${subCommands.map(
  subCommand=>`${subCommand.name} ${subCommand.arguments ? subCommand.arguments.join(' ') : ''}`.padEnd(20, ' ') + subCommand.description +
  subCommand.options?.map(opt=>`\n ${opt.alias}, ${opt.name}`.padEnd(21, ' ') + opt.description).join('\n')
).join('\n')}

`

async function chat(model:string, query:string) {
  const completion = await client.chat.completions.create({
    model,
    messages:[
      {role:'system', content:'你是位人工智能助手。'},
      {role:'user', content:query}
    ],
    temperature: 0.7
  })
  const aiMessage = completion.choices[0].message
  return aiMessage.content
}

function normalCommandArgs(args:minimist.ParsedArgs): minimist.ParsedArgs {
  if (Object.hasOwn(args, 'i')) {
    args['interactive'] = args['i']
    delete args['i']
  }
  return args
}

async function parseCliArgs(argv=process.argv.slice(2)) {
  const args = normalCommandArgs(minimist(argv))

  if (args.v || args.version) {
    console.log(version)
  } else if (args.h || args.help) {
    console.log(helpInfo)
  }

  if (args._.length) {
    const [name, ...params] = args._
    const action = subCommands.find(subCommand=>subCommand.name === name)?.action as any
    action?.(...params, args)
  }
}

parseCliArgs()
