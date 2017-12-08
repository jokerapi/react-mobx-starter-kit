import { Component } from 'react'
import { reactRouterCache } from '@component'
import type { htmlNode } from '@constants'

@reactRouterCache
export default class App extends Component {
  props: {
    children: htmlNode
  }

  render() {
    return this.props.children
  }
}
