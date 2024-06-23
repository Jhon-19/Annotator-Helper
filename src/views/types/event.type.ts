export interface IEvent {
  trigger: string
  type: string
  arguments: IArgument[]
}

export interface IArgument {
  role: string
  argument: string
}

export interface ISimpleArgument {
  [key: string]: string
}
