import GitBranchSVG from './git-branch.svg?react'
import { SvgIcon, SvgIconProps } from '@mui/material'

export default function GitBranch(props: SvgIconProps) {
  return <SvgIcon { ...props } component={ GitBranchSVG } inheritViewBox />
}
