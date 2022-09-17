const arrayBufferToString = (buffer: BlobPart, callback: (result: BlobPart | null) => void) => {
  var blob = new Blob([buffer], { type: 'text/plain' })
  var reader = new FileReader()
  reader.onload = function (evt) {
    callback(evt.target?.result || null)
  }
  reader.readAsText(blob, 'utf-8')
}

export default arrayBufferToString
