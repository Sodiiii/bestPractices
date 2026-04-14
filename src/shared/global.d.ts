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

declare module '*.svg?url' {
  const src: string
  export default src
}

declare module '*.png?url' {
  const src: string
  export default src
}

declare module '*.jpg?url' {
  const src: string
  export default src
}

declare module '*.jpeg?url' {
  const src: string
  export default src
}

declare module '*.webp?url' {
  const src: string
  export default src
}

declare module '*.png';
declare module '*.jpg';
declare module '*.webp';
declare module '*.jpeg';
