import { css } from '@codemirror/lang-css'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { minimalSetup } from 'codemirror'
import React, { useEffect, useRef } from 'react'

const StyleEditor = () => {
  const editorView = useRef<EditorView>(null)
  const editor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onmessage(event: MessageEvent) {
      if (event.origin !== 'https://www.notion.so') return
      if (event.data?.s !== 'notion-nice') return
      const cm = editorView.current
      if (cm === null) return
      const { type, value } = event.data
      switch (type) {
        case 'setDoc':
          cm.dispatch({
            changes: { from: 0, to: cm.state.doc.length, insert: value }
          })
          break
        case 'setEditable':
          //   cm.dispatch({
          //     effects: EditorView.editable.set(value)
          //   })
          break

        default:
          break
      }
    }
    window.addEventListener('message', onmessage)
    return () => {
      window.removeEventListener('message', onmessage)
    }
  }, [])

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

    editorView.current = view

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <div>
      <div ref={editor} className='relative flex-none w-full h-full'></div>
      <button
        onClick={() => {
          const cm = editorView.current
          if (cm === null) return
          window.parent.postMessage(
            { s: 'notion-nice', type: 'save', value: cm.state.doc.toString() },
            '*'
          )
        }}
      >
        Save
      </button>
    </div>
  )
}

export default StyleEditor
