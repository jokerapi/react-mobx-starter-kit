import React, { Component, Fragment } from 'react'
import { withRouter } from "react-router-dom"
import { PullToRefresh, WhiteSpace, Button } from 'antd-mobile'
import { autoBind, md } from '@utils'
import type { location } from '@constants'

@withRouter
export default class ScrollView extends Component {
  static scrollTopList = new Map()

  props: {
    children: any,
    location: location,
    onRefresh: Function,
    onEndReached?: Function,
    id?: string,
  }

  scrollView: HTMLDivElement

  locationKey = (this.props.location.key || 'root') + (this.props.id || '')

  scrollTop = 0

  state = {
    refreshing: false,
    loading: false,
  }

  componentDidMount() {
    const scrollTop = this.constructor.scrollTopList.get(this.locationKey)
    scrollTop && this.scrollView.scrollTo(0, scrollTop)
  }

  componentWillUnmount() {
    this.constructor.scrollTopList.set(this.locationKey, this.scrollView.scrollTop)
  }

  @autoBind
  getScrollViewDom(scrollView) {
    this.scrollView = scrollView
    if (scrollView && md.match('MicroMessenger')) {
      let startY = 0
      scrollView.addEventListener('touchstart', (e) => {
        startY = e.changedTouches[0].pageY
      })
      scrollView.addEventListener('touchmove', (e) => {
        const endY = e.changedTouches[0].pageY
        const distanceY = endY - startY
        if (scrollView.scrollTop === 0 && distanceY > 0) {
          e.preventDefault()
        }
      })
    }
  }

  @autoBind
  onRefresh() {
    if (this.state.refreshing) return
    this.setState({ refreshing: true })
    Promise.resolve(this.props.onRefresh()).finally(() =>
      this.setState({ refreshing: false })
    )
  }

  @autoBind
  async onEndReached() {
    if (this.state.loading) return
    this.setState({ loading: true })
    Promise.resolve(this.props.onEndReached()).finally(() =>
      this.setState({ loading: false })
    )
  }

  @autoBind
  onScroll(event) {
    const { scrollHeight, clientHeight, scrollTop } = event.target
    const distanceY = scrollTop - this.scrollTop
    this.scrollTop = scrollTop
    const isBottom = clientHeight + scrollTop >= scrollHeight - 30
    if (isBottom && distanceY > 0) this.onEndReached()
  }

  renderChildren() {
    const { loading } = this.state
    return (
      <Fragment>
        {this.props.children}
        {
          this.props.onEndReached && (
            <Fragment>
              <WhiteSpace/>
              <Button loading={loading} onClick={this.onEndReached}>
                {loading ? '加载中...' : '查看更多'}
              </Button>
              <WhiteSpace/>
            </Fragment>
          )
        }
      </Fragment>
    )
  }

  render() {
    const { onEndReached, onRefresh } = this.props
    return (
      <div
        style={{ height: '100%', overflow: 'auto' }} ref={this.getScrollViewDom}
        onScroll={onEndReached ? this.onScroll : null}
      >
        {
          do {
            if (onRefresh) {
              <PullToRefresh
                direction={'down'}
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              >
                {this.renderChildren()}
              </PullToRefresh>
            } else {
              this.renderChildren()
            }
          }
        }
      </div>
    )
  }
}
