import React from 'react'
import * as ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import WeekPlanner from './WeekPlanner.jsx'

// The app's Portal uses window.ReactDOM.createPortal — expose globals for it.
window.React = React
window.ReactDOM = ReactDOM

createRoot(document.getElementById('root')).render(<WeekPlanner />)
