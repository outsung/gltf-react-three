import React from 'react'
import { useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import suzanne from '../public/suzanne.gltf'
import SEO from '../components/SEO'
import FileDrop from '../components/fileDrop'
import arrayBufferToString from '../utils/arrayBufferToString'
import Footer from '../components/footer'
import useStore from '../utils/store'

const Loading = () => <p className="text-4xl font-bold">Loading ...</p>

const Result = dynamic(() => import('../components/result'), {
  ssr: false,
  loading: Loading,
})

export default function Home() {
  const { buffer } = useStore((state) => ({
    buffer: state.buffer,
  }))

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.error('file reading was aborted')
      reader.onerror = () => console.error('file reading has failed')
      reader.onload = async () => {
        const data = reader.result as string
        useStore.setState({ buffer: data, fileName: file.name })
        arrayBufferToString(data, (a) => useStore.setState({ textOriginalFile: a as string }))
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const useSuzanne = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    useStore.setState({ buffer: suzanne, fileName: 'suzanne.gltf', textOriginalFile: suzanne })
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <main className="flex flex-col items-center justify-center flex-1" style={{ height: 'calc(100vh - 56px)' }}>
        {buffer ? <Result /> : <FileDrop onDrop={onDrop} useSuzanne={useSuzanne} />}
      </main>
      <SEO />
      <Toaster />
      <Footer />
    </div>
  )
}
