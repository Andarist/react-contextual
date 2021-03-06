import React from 'react'
import PropTypes from 'prop-types'
import DefaultContext, { createNamedContext, removeNamedContext } from './context'

export class RenderOnce extends React.Component {
    shouldComponentUpdate() {
        return false
    }
    render() {
        return this.props.children
    }
}

export class Provider extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        initialState: PropTypes.object.isRequired,
        actions: PropTypes.object,
        renderAlways: PropTypes.bool,
    }
    static defaultProps = { renderAlways: false }
    constructor(props) {
        super()
        this.state = props.initialState || {}
        this.Context = props.id ? createNamedContext(props.id) : DefaultContext
        if (props.actions) {
            this.actions = Object.keys(props.actions).reduce(
                (acc, name) => ({ ...acc, [name]: (...args) => this.setAsync(props.actions[name](...args)) }),
                {},
            )
        }
    }
    setAsync(arg) {
        if (typeof arg === 'function') return Promise.resolve(arg(this.state)).then(state => this.setState(state))
        else this.setState(arg)
    }
    componentWillUnmount() {
        if (this.props.id) removeNamedContext(this.props.id)
    }
    render() {
        const { state, actions, props, Context } = this
        const value = { ...state, ...(actions ? { actions } : {}) }
        return (
            <Context.Provider value={value}>
                {props.renderAlways ? props.children : <RenderOnce children={props.children} />}
            </Context.Provider>
        )
    }
}
