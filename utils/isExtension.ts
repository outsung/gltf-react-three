export const getFileExtension = (file: string) => file.split('.').pop()

export const isJson = (file: string) => file.split('.').pop() === 'json'

export const isGlb = (file: string) => file.split('.').pop() === 'glb'
