declare module '*.scss' {
  type IClassNames = Record<string, string>
  const classNames: IClassNames
  export = classNames
}

declare module '*.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg' {
  import type React from 'react'

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}

declare module '*.png';
declare module '*.jpg';
declare module '*.webp';
declare module '*.jpeg';
