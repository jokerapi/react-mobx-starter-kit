import { observable, toJS, computed } from 'mobx'
import { StoreHelper } from './store-helper'
import type { ErrorType, CResponse } from '@utils'

export class WebAPIStore extends StoreHelper {
  fetchData: Function
  @observable isFetching = false
  @observable isRejected = false
  @observable isFulfilled = false
  @observable error: ?ErrorType = null

  setPendingState(actionName) {
    this.isFetching = true
    this.logMessage("%cpending  ", "color:blue", actionName)
  }

  setFulfilledState(response: CResponse | Object, actionName) {
    const newState = do {
      if (response instanceof window.Response) response.data
      else response
    }
    Object.assign(this, {
      isFetching: false,
      isRejected: false,
      isFulfilled: true,
      error: null,
    }, newState)
    this.logMessage("%cfulfilled", "color:green", actionName)
  }

  setRejectedState(error, actionName, options) {
    const nextState = {
      error,
      isFetching: false,
      isRejected: true,
    }
    Object.assign(this, nextState, options)
    this.logMessage("%crejected", "color:red", actionName)
  }

  logMessage(status, color, actionName) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        status,color,
        `${this.constructor.name}::${this.instanceKey}->${actionName}`,
        { state: toJS(this) }
      )
    }
  }

  loadingAll(...webAPIStores: WebAPIStore[]) {
    return this.loading || !!webAPIStores.find(item => item.loading)
  }

  @computed
  get loading() {
    return this.isFetching
  }
}
