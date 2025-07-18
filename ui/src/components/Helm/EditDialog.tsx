import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { AddCircleOutline, ContentCopy, ExpandMore, RemoveCircleOutline } from '@mui/icons-material'
import { parse } from 'yaml'
import { editHelmChart, HelmListItem } from '../../clients/helm'
import Modal from '../Modal'

const ddClient = createDockerDesktopClient()

export default function EditDialog({ workload, open, onSubmit = () => null, onClose = () => null }: 
{ workload: HelmListItem, open: boolean, onSubmit?: (result: HelmListItem) => any, onError?: (e: any) => any, onClose?: () => any }) {
  const [ values, setValues ] = useState<{ key: string, value: string }[]>([])
  const [ currentValue, setCurrentValue ] = useState<{ key?: string, value?: string }>()
  const [ error, setError ] = useState<string>()
  const [ state, setState ] = useState<'ready' | 'updating' | 'error'>('ready')

  const appName = workload.chart.split('-').slice(0, -1).join('-')

  function upgrade() {
    setState('updating')
    editHelmChart(ddClient, workload, values)
      .then(result => {
        onSubmit(result)
        setState('ready')
      })
      .catch(e => {
        setState('error')
        setError(e)
      })
  }

  if (error) {
    return (
      <Modal
        title='Error'
        subtitle='There was an unexpected error updating the application'
        open={ open }
        onClose={ onClose }>
        <Box sx={ { p: 2, background: 'rgba(125, 125, 125, 0.1)' } }>
          { 
            error.split('\n')
              .filter(line => line)
              .map((line, i) => <Typography key={ `error-line-${i}` } variant='code' component='p'>&gt; { line }</Typography>) 
          }
        </Box>
        <Stack direction='row' justifyContent='space-between' sx={ { mt: 2 } }>
          <Button 
            color='inherit'
            onClick={ () => setError(undefined) }
            sx={ { mt: 1 } }>Go back</Button>
          <Button 
            color='error'
            onClick={ () => {
              setError(undefined)
              close()
            } }
            sx={ { mt: 1 } }>Cancel update</Button>
        </Stack>
      </Modal>
    )
  }

  return (
    <Modal
      title={ `Edit ${ workload.name }` }
      subtitle='Set Helm Chart values manually or through a YAML file'
      open={ open }
      onClose={ onClose }
      onSubmit={ upgrade }>
      { 
        values.map((v, i) => <Stack key={ `value-${i}` } direction='row' alignItems='center' spacing={ 2 } sx={ { mt: 2 } }>
          <TextField 
            onChange={ (e) => setValues(values.map((v, j) => i == j ? { key: e.target.value, value: v.value } : v)) }
            value={ v.key }
            size='small'
            sx={ { flexGrow: 1 } } />
          <TextField 
            onChange={ (e) => setValues(values.map((v, j) => i == j ? { key: v.key, value: e.target.value } : v)) }
            value={ v.value }
            size='small'
            sx={ { flexGrow: 1 } } />
          <IconButton onClick={ () => setValues(values.filter((v, j) => j !== i)) }>
            <RemoveCircleOutline />
          </IconButton>
        </Stack>) }
      <Stack 
        direction='row' 
        alignItems='center' 
        spacing={ 2 }
        sx={ { my: 2 } }>
        <TextField 
          placeholder='Key'
          value={ currentValue?.key || '' }
          size='small'
          onChange={ (e) => setCurrentValue({ ...currentValue, key: e.target.value }) }
          sx={ { flexGrow: 1 } } />
        <TextField 
          placeholder='Value'
          value={ currentValue?.value || '' }
          size='small'
          onChange={ (e) => setCurrentValue({ ...currentValue, value: e.target.value }) }
          sx={ { flexGrow: 1 } } />
        <IconButton onClick={ () => {
          if (currentValue?.key && currentValue.value) setValues([ ...values, (currentValue as { key: string, value: string }) ]) 
          setCurrentValue({})
        } }>
          <AddCircleOutline />
        </IconButton>
      </Stack>
      <Stack direction='row' alignItems='center' flexWrap='wrap' rowGap={ 2 } sx={ { overflowX: 'hidden', pt: '1px' } }>
        <FilePicker onSelect={ newValues => setValues([...values, ...newValues]) } />
      </Stack>
      <Accordion sx={ { mt: 2, boxShadow: 'none', '::before': { content: 'unset' } } }>
        <AccordionSummary expandIcon={ <ExpandMore /> } sx={ { p: 0, m: 0 } }>
          <Stack>
            <Typography variant='h4'>Need help?</Typography>
            <Typography variant='h5'>Run this command to get the chart's values</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction='row' alignItems='center' justifyContent='space-between' sx={ { background: 'rgba(0, 0, 0, 0.1)', p: 1 } }>
            <Typography variant='code'>helm show values oci://dp.apps.rancher.io/charts/{ appName } --version { workload.version }</Typography>
            <Tooltip title='Copy'>
              <IconButton onClick={ () => navigator.clipboard.writeText(`helm show values oci://dp.apps.rancher.io/charts/${ appName } --version ${ workload.version }`) } size='small'>
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Stack direction='row' justifyContent='space-between' sx={ { mt: 2 } }>
        <Button 
          color='inherit'
          onClick={ onClose }
          disabled={ state === 'updating' }>Cancel</Button>
        {
          state === 'updating' ? 
            <Button 
              type='submit'
              variant='contained'
              color='inherit'
              disabled>Updating...</Button> : 
            <Button 
              type='submit'
              variant='contained'
              disabled={ values.length === 0 }>Update</Button>
        }
      </Stack>
    </Modal>
  )
}

function FilePicker({ onSelect = () => null }: { onSelect?: (values: { key: string, value: string }[]) => any }) {
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
