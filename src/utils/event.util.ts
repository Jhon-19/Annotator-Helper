import type { IArgument, IEvent, ISimpleArgument } from '@/views/types/event.type'
import { cloneDeep } from 'lodash'

export function checkEventInSet(targetEvent: IEvent, eventSet: IEvent[]) {
  let isSameEvent = false
  for (let event of eventSet) {
    isSameEvent = event.trigger === targetEvent.trigger && event.type === targetEvent.type
  }
  return isSameEvent
}

export function shallowCopyEvent(oldEvent: IEvent, newEvent: IEvent) {
  Object.entries(oldEvent).forEach(([key, value]) => {
    if (key === 'arguments') {
      newEvent.arguments = cloneDeep(oldEvent.arguments)
    } else {
      newEvent[key as keyof IEvent] = value
    }
  })
}

export function parseContent(args: IArgument[]) {
  const simpleArguments: ISimpleArgument = {}
  args.forEach((arg) => {
    simpleArguments[arg.role] = arg.argument
  })
  return simpleArguments
}
