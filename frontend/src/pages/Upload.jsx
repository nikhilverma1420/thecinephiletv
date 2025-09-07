import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCloudUpload, MdCheckCircle, MdError, MdImage, MdVideoFile, MdDownload } from 'react-icons/md';

const Upload = () => {
  // Form data states
  const [formData, setFormData] = useState({
    title: '',
    cast: '',
    quality: '',
    description: '',
    downloadLink: '',
    photoLink: ''
  });
  
  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  // UI states
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false, photo: false });
  const navigate = useNavigate();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file changes for different file types
  const handleFileChange = (e, fileType) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile, fileType);
    }
  };

  const validateAndSetFile = (file, fileType) => {
    let allowedTypes, maxSize, errorMessage;
    
    switch (fileType) {
      case 'video':
        allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv'];
        maxSize = 100 * 1024 * 1024; // 100MB
        errorMessage = 'Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WEBM, MKV)';
        break;
      case 'thumbnail':
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        maxSize = 5 * 1024 * 1024; // 5MB
        errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, WEBP)';
        break;
      case 'photo':
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        maxSize = 10 * 1024 * 1024; // 10MB
        errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, WEBP)';
        break;
      default:
        return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus(errorMessage);
      return;
    }
    
    if (file.size > maxSize) {
      setUploadStatus(`File size must be less than ${formatFileSize(maxSize)}`);
      return;
    }
    
    // Set the appropriate file state
    switch (fileType) {
      case 'video':
        setVideoFile(file);
        break;
      case 'thumbnail':
        setThumbnailFile(file);
        break;
      case 'photo':
        setPhotoFile(file);
        break;
    }
    
    setUploadStatus('');
  };

  const handleDrag = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [fileType]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], fileType);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!thumbnailFile) {
      setUploadStatus('Please select a thumbnail image to upload');
      return;
    }

    if (!formData.title.trim()) {
      setUploadStatus('Please enter a title');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('thumbnail', thumbnailFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('cast', formData.cast);
      uploadFormData.append('quality', formData.quality);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('downloadLink', formData.downloadLink);
      uploadFormData.append('photoLink', formData.photoLink);
      
      if (videoFile) {
        uploadFormData.append('video', videoFile);
      }
      if (photoFile) {
        uploadFormData.append('photo', photoFile);
      }
      
      uploadFormData.append('email', 'cornhub1420@gmail.com'); // Admin email for authentication

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('Upload successful!');
        resetForm();
      } else {
        setUploadStatus(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed: Network error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setFormData({
      title: '',
      cast: '',
      quality: '',
      description: '',
      downloadLink: '',
      photoLink: ''
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setPhotoFile(null);
    setUploadStatus('');
    
    // Reset file inputs
    ['videoFile', 'thumbnailFile', 'photoFile'].forEach(id => {
      const fileInput = document.getElementById(id);
      if (fileInput) fileInput.value = '';
    });
  };

  const removeFile = (fileType) => {
    switch (fileType) {
      case 'video':
        setVideoFile(null);
        break;
      case 'thumbnail':
        setThumbnailFile(null);
        break;
      case 'photo':
        setPhotoFile(null);
        break;
    }
    const fileInput = document.getElementById(fileType + 'File');
    if (fileInput) fileInput.value = '';
  };

  const clearAllPosts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL posts? This action cannot be undone.')) {
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('Clearing all posts...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/clear`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('All posts cleared successfully!');
      } else {
        setUploadStatus(`Failed to clear posts: ${data.message}`);
      }
    } catch (error) {
      console.error('Clear posts error:', error);
      setUploadStatus('Failed to clear posts: Network error');
    } finally {
      setUploading(false);
    }
  };

  const createSamplePosts = async () => {
    try {
      setUploading(true);
      setUploadStatus('Creating sample posts...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/sample`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(`Sample posts created successfully! ${data.count} posts added.`);
      } else {
        setUploadStatus(`Failed to create sample posts: ${data.message}`);
      }
    } catch (error) {
      console.error('Create sample posts error:', error);
      setUploadStatus('Failed to create sample posts: Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Upload Content</h1>
          <p className="mt-2 text-gray-600">Upload videos and content to The Cinephile TV platform</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleUpload} className="space-y-8">
            
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Cast Input */}
            <div>
              <label htmlFor="cast" className="block text-sm font-medium text-gray-700 mb-2">
                Cast
              </label>
              <input
                type="text"
                id="cast"
                name="cast"
                value={formData.cast}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter cast members (comma separated)"
              />
            </div>

            {/* Quality Dropdown */}
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                id="quality"
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select quality</option>
                <option value="480p">480p (SD)</option>
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="4K">4K (Ultra HD)</option>
                <option value="8K">8K (Ultra HD)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Enter video description"
              />
            </div>

            {/* File Upload Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File (Optional)
                </label>
                <div 
                  className={`flex flex-col justify-center items-center px-6 pt-8 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[200px] ${
                    dragActive.video 
                      ? 'border-blue-400 bg-blue-50' 
                      : videoFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'video')}
                  onDragLeave={(e) => handleDrag(e, 'video')}
                  onDragOver={(e) => handleDrag(e, 'video')}
                  onDrop={(e) => handleDrop(e, 'video')}
                  onClick={() => document.getElementById('videoFile').click()}
                >
                  <MdVideoFile className={`h-12 w-12 mb-4 ${dragActive.video ? 'text-blue-400' : videoFile ? 'text-green-400' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Upload Video</p>
                    <p className="text-xs text-gray-500">MP4, AVI, MOV, etc.</p>
                    <p className="text-xs text-gray-500">Max 100MB</p>
                  </div>
                  <input
                    id="videoFile"
                    type="file"
                    className="sr-only"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    disabled={uploading}
                  />
                </div>
                {videoFile && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MdCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">{videoFile.name}</p>
                          <p className="text-xs text-green-700">{formatFileSize(videoFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('video')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail *
                </label>
                <div 
                  className={`flex flex-col justify-center items-center px-6 pt-8 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[200px] ${
                    dragActive.thumbnail 
                      ? 'border-blue-400 bg-blue-50' 
                      : thumbnailFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'thumbnail')}
                  onDragLeave={(e) => handleDrag(e, 'thumbnail')}
                  onDragOver={(e) => handleDrag(e, 'thumbnail')}
                  onDrop={(e) => handleDrop(e, 'thumbnail')}
                  onClick={() => document.getElementById('thumbnailFile').click()}
                >
                  <MdImage className={`h-12 w-12 mb-4 ${dragActive.thumbnail ? 'text-blue-400' : thumbnailFile ? 'text-green-400' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Upload Thumbnail</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, GIF</p>
                    <p className="text-xs text-gray-500">Max 5MB</p>
                  </div>
                  <input
                    id="thumbnailFile"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    disabled={uploading}
                  />
                </div>
                {thumbnailFile && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MdCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">{thumbnailFile.name}</p>
                          <p className="text-xs text-green-700">{formatFileSize(thumbnailFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('thumbnail')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div 
                  className={`flex flex-col justify-center items-center px-6 pt-8 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[200px] ${
                    dragActive.photo 
                      ? 'border-blue-400 bg-blue-50' 
                      : photoFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => handleDrag(e, 'photo')}
                  onDragLeave={(e) => handleDrag(e, 'photo')}
                  onDragOver={(e) => handleDrag(e, 'photo')}
                  onDrop={(e) => handleDrop(e, 'photo')}
                  onClick={() => document.getElementById('photoFile').click()}
                >
                  <MdImage className={`h-12 w-12 mb-4 ${dragActive.photo ? 'text-blue-400' : photoFile ? 'text-green-400' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Upload Photo</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, GIF</p>
                    <p className="text-xs text-gray-500">Max 10MB</p>
                  </div>
                  <input
                    id="photoFile"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    disabled={uploading}
                  />
                </div>
                {photoFile && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MdCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">{photoFile.name}</p>
                          <p className="text-xs text-green-700">{formatFileSize(photoFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('photo')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Link Input */}
            <div>
              <label htmlFor="downloadLink" className="block text-sm font-medium text-gray-700 mb-2">
                Download Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdDownload className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="downloadLink"
                  name="downloadLink"
                  value={formData.downloadLink}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter download link (optional)"
                />
              </div>
            </div>

            {/* Photo Link Input */}
            <div>
              <label htmlFor="photoLink" className="block text-sm font-medium text-gray-700 mb-2">
                Photo Link (Alternative to Photo Upload)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdImage className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="photoLink"
                  name="photoLink"
                  value={formData.photoLink}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter photo URL (optional)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use this if you want to link to an external photo instead of uploading one
              </p>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg flex items-center ${
                uploadStatus.includes('successful') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : uploadStatus.includes('failed') || uploadStatus.includes('Please select') || uploadStatus.includes('Please enter')
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                {uploadStatus.includes('successful') ? (
                  <MdCheckCircle className="h-5 w-5 mr-2" />
                ) : uploadStatus.includes('failed') || uploadStatus.includes('Please select') || uploadStatus.includes('Please enter') ? (
                  <MdError className="h-5 w-5 mr-2" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                )}
                <p className="text-sm font-medium">{uploadStatus}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createSamplePosts}
                  disabled={uploading}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Sample Posts
                </button>
                <button
                  type="button"
                  onClick={clearAllPosts}
                  disabled={uploading}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Clear All Posts
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={!thumbnailFile || !formData.title.trim() || uploading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    !thumbnailFile || !formData.title.trim() || uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload Content'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Upload Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Required Files</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Thumbnail: Max 5MB (JPEG, PNG, GIF, WEBP)</li>
                <li>• Title is required</li>
                <li>• Thumbnail is required for display</li>
                <li>• Images are automatically resized to A4 size (595×842px)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Optional Files</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Video: Max 100MB (MP4, AVI, MOV, WMV, FLV, WEBM, MKV)</li>
                <li>• Photo: Max 10MB (JPEG, PNG, GIF, WEBP)</li>
                <li>• Both are optional</li>
                <li>• Photos are also resized to A4 size</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All uploaded images (thumbnails and photos) will be automatically converted to A4 size (595×842 pixels) with white background padding to maintain aspect ratio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;