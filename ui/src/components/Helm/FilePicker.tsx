import { Stack, Button, Typography } from '@mui/material'
import { useRef, useState, useEffect, ChangeEvent } from 'react'
import { parse } from 'yaml'

export default function FilePicker({ onSelect = () => null, }: 
{ onSelect?: (values: { key: string, value: string }[]) => any }) {
  const fileInputRef = useRef<any>(null)
  const [ helperText, setHelperText ] = useState('No file selected')
  const [ error, setError ] = useState<string>()

  useEffect(() => {
    if (fileInputRef.current && fileInputRef.current.value) {
      const file = fileInputRef.current.value
      setHelperText(file.replace('C:\\fakepath\\', ''))
    }
  }, [])

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files?.length > 0) {
      const file = e.target.files[0]
      setHelperText(file.name)

      if (file.type === 'application/x-yaml' || file.type === 'text/yaml') {
        const reader = new FileReader()
  
        reader.onload = function(event: ProgressEvent<FileReader>) {
          if (event && event.target) {
            const yaml = parse(event.target.result as string)
            const flattened: { [key: string]: string } = flatten(yaml)
            onSelect(Object.keys(flattened).map(k => { return { key: k, value: flattened[k] } }))
            setError(undefined)
          }
        }

        reader.onerror = function() {
          setError('Invalid values file')
        }
      
        reader.readAsText(file)
      } else {
        setError('Selected file is not a YAML')
      }
    }
  }

  function flatten(data: any) {
    let result: any = {}

    function recurse(cur: any, prop: any) {
      if (Object(cur) !== cur) {
        result[prop] = cur
      } else if (Array.isArray(cur)) {

        for(let i = 0, l = cur.length; i < l; i++) {
          recurse(cur[i], prop + '[' + i + ']')
          if (l == 0) result[prop] = []
        }

      } else {
        let isEmpty = true

        for (let p in cur) {
          isEmpty = false
          recurse(cur[p], prop ? prop+'.'+p : p)
        }

        if (isEmpty && prop) result[prop] = {}
      }
    }

    recurse(data, '')

    return result
  }

  return (
    <Stack direction='row' alignItems='center' gap={ 2 }>
      <input type='file' accept='application/x-yaml' name='values' ref={ fileInputRef } onChange={ onFileChange } hidden />
      <Button variant='outlined' size='small' onClick={ () => fileInputRef && fileInputRef.current.click() } sx={ { minWidth: 'fit-content' } }>Upload values YAML</Button>
      <Typography 
        variant='body2' 
        color={ error ? 'error' : 'text.primary' }
        sx={ { 
          whiteSpace: 'nowrap', 
          textOverflow: 'ellipsis', 
          overflow: 'hidden', 
          width: { xs: '100%', md: '300px' } } 
        }>
        { error ? error : helperText }
      </Typography>
    </Stack>
  )
}
