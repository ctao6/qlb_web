'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function InfesEx({ name, description }: { name: string; description: string }) {
  return (
    <div className="mt-4">
      <strong>{name}:</strong> {description}
    </div>
  );
}

export default function QlbPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); 
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', image);
    
    try {
      const response = await fetch('https://qlb-detect.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error predicting image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8">
      <header>
        <Link href="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </header>
      <h1 className="text-2xl font-bold mt-4">Queensland Longhorn Beetle Resources</h1>
      <p>Tools and information to help with invasive QLBs</p>
      
      <section className="mt-6 border p-4 rounded">
        <h2>QLB Infestation Detector</h2>
        <p>Upload Picture of Suspected Infestation</p>
        
        <div className="flex flex-col items-center p-6">
          <form onSubmit={handleUpload} className="space-y-4 flex flex-col items-center">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <button type="submit" disabled={loading} className="btn bg-blue-600 text-white p-2 rounded disabled:bg-gray-400">
              {loading ? 'Analyzing...' : 'Analyze Tree Health'}
            </button>
          </form>

          {preview && (
            <div className="mt-6 border-2 border-dashed p-2 rounded">
              <p className="text-sm text-gray-500 mb-2 text-center">Preview:</p>
              <Image 
                src={preview} 
                width={500} 
                height={500} 
                alt="Uploaded preview" 
                className="object-contain max-h-[500px]"
                unoptimized
              />
            </div>
          )}

          {result && (
            <div className="mt-6 text-center">
              <h3>
                Prediction:{' '}
                <span className={result.label === 'INFESTED' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                  {result.label}
                </span>
              </h3>
              <p>Confidence: {result.confidence.toFixed(2)}%</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 border-t pt-4">
          <h3 className="font-bold">What to look for:</h3>
          <InfesEx name="Frass" description="Chewed up wood debris left behind by beetle larvae burrowing through the tree." />
          <InfesEx name="Sap" description="Sap excreted by the tree in an attempt to defend against beetles." />
          <InfesEx name="Bore Holes" description="Exit holes from grown beetles leaving the host tree." />
        </div>
      </section>
    </main>
  );
}
