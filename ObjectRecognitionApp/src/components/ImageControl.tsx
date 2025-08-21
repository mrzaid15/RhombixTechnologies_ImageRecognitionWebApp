import './index.css'
import { useState, type ChangeEvent } from 'react'
import { useImageUpload } from '../hooks/useImageUploadHook'
import { api_key } from '../keys/api_keys'


const ImageControl = () => {

    const [image, setImage] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const {uploadImage , prediction, isLoading, error} = useImageUpload(
        `${api_key}/predict`
    )

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setImage(URL.createObjectURL(file))
        }
    }

    const handleUpload = async () => {
        if(selectedFile){
            await uploadImage(selectedFile)
        } else {
            console.error("No file is selected ")
        }
    }
    

    return (
        <div className='container'>
            <div className='inner-container'>
                {!image && <p>Please upload your image</p>}

                {image && (
                    <div className='image-container'>
                        <img src={image} alt='uploaded' className='image'/>

                    </div>
                )}

                {prediction && prediction[0]  && (
                    <div className='prediction-box'>
                        <p className='category-text'>
                            {prediction[0].category.toUpperCase()}
                        </p>
                        <p className='category-accuracy'>
                            {(prediction[0].score * 100).toFixed(1)}% Accuracy
                        </p>

                    </div>
                )}

                {error && <p className='error'>{error}</p>}

                <input type='file' onChange={handleImageChange} accept='image/*' />
                <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
                    {isLoading ? "Uploading..." : image ? "Identify Image" : "Upload Image"}
                </button>
            </div>
        </div>
    )
}

export default ImageControl