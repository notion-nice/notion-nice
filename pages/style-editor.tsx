import { css } from '@codemirror/lang-css'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { minimalSetup } from 'codemirror'
import React, { useEffect, useRef } from 'react'

const StyleEditor = () => {
  const editor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const theme = EditorView.theme({
      '&': {
        height: '100vh',
        minHeight: '200px'
      },
      '.cm-scroller': { overflow: 'auto' }
    })

    const startState = EditorState.create({
      doc: '',
      extensions: [
        css(),
        theme,
        minimalSetup,
        lineNumbers(),
        EditorView.lineWrapping
      ]
    })
    const view = new EditorView({
      state: startState,
      parent: editor.current
    })

    return () => {
      view.destroy()
    }
  }, [])

  return <div ref={editor} className='relative flex-none w-full h-full'></div>
}

export default StyleEditor
