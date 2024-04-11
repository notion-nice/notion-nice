import { css } from '@codemirror/lang-css'
import { EditorView } from '@codemirror/view'
import { Compartment, EditorState } from '@codemirror/state'
import { oneDark } from '@/components/oneDark'
import { throttle } from 'lodash-es'
import { minimalSetup } from 'codemirror'
import React, { useEffect, useRef } from 'react'

const StyleEditor = () => {
  const editorView = useRef<EditorView>(null)
  const editor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const editable = true
    const enableAction = new Compartment()
    const editorTheme = new Compartment()
    const oneLight = EditorView.theme({})
    const theme = EditorView.theme({
      '&': {
        height: '100vh',
        minHeight: '200px'
      },
      '.cm-scroller': { overflow: 'auto' }
    })

    const onUpdate = throttle((doc: string) => {
      window.parent.postMessage(
        { s: 'notion-nice', type: 'save', value: doc },
        '*'
      )
    }, 800)

    const updateListener = EditorView.updateListener.of((vu) => {
      if (vu.docChanged) {
        const doc = vu.state.doc
        onUpdate(doc.toString())
      }
    })

    const startState = EditorState.create({
      doc: '',
      extensions: [
        css(),
        theme,
        minimalSetup,
        updateListener,
        EditorView.lineWrapping,
        editorTheme.of(oneLight),
        enableAction.of([
          EditorView.editable.of(editable),
          EditorState.readOnly.of(!editable)
        ])
      ]
    })
    const cm = new EditorView({
      state: startState,
      parent: editor.current
    })
    editorView.current = cm

    function onmessage(event: MessageEvent) {
      if (event.origin !== 'https://www.notion.so') return
      if (event.data?.s !== 'notion-nice') return
      const { type, value } = event.data
      switch (type) {
        case 'setDoc':
          cm.dispatch({
            changes: { from: 0, to: cm.state.doc.length, insert: value },
            effects: [EditorView.scrollIntoView(0)]
          })
          break
        case 'setEditable':
          cm.dispatch({
            effects: [
              enableAction.reconfigure([
                EditorView.editable.of(!!value),
                EditorState.readOnly.of(!value)
              ])
            ]
          })
          break
        case 'selectedTheme':
          cm.dispatch({
            effects: editorTheme.reconfigure(
              value === 'dark' ? oneDark : oneLight
            )
          })
          break

        default:
          break
      }
    }
    window.addEventListener('message', onmessage)

    return () => {
      cm.destroy()
      window.removeEventListener('message', onmessage)
    }
  }, [])

  return <div ref={editor} className='relative flex-none w-full h-full'></div>
}

export default StyleEditor
