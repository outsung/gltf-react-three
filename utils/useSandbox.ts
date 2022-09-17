import { ViewerProps } from 'components/viewer'
import { useEffect, useState } from 'react'
import { sandboxCode, SandboxCodeFiles } from './sandboxCode'

interface Config extends ViewerProps {
  types: boolean
  shadows: boolean
  instanceall: boolean
  instance: boolean
  verbose: boolean
  keepnames: boolean
  keepgroups: boolean
  aggressive: boolean
  meta: boolean
  precision: number
}

export interface UseSandboxProps {
  fileName: string
  textOriginalFile: string
  code: string
  config: Config
}
const useSandbox = (props: UseSandboxProps) => {
  const [sandboxId, setSandboxId] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setErr] = useState(false)
  const [sandboxCodeReturn, setSandboxCode] = useState<SandboxCodeFiles>()

  const createSandbox = async () => {
    setSandboxCode(sandboxCode(props))
    setLoading(true)
    setErr(false)
    try {
      const data = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(sandboxCode(props)),
      }).then((x) => x.json())

      if (data.sandbox_id) {
        setSandboxId(data.sandbox_id as string)
      } else {
        setErr(true)
      }
    } catch {
      setErr(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    createSandbox()
  }, [props.code])

  return [loading, sandboxId, error, sandboxCodeReturn] as const
}

export default useSandbox
