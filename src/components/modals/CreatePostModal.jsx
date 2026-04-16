import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';

const CreatePostModal = ({ onClose, onSubmit, CATEGORIES, createLoading, selectedFile, setSelectedFile, previewUrl, setPreviewUrl, handleFileChange }) => {
  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="modal-overlay" style={{ zIndex: 200 }}
      onClick={onClose}
    >
      <Motion.div style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '400px' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '18px', textAlign: 'center' }}>NUEVA PUBLICACIÓN</h3>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            name="title" 
            placeholder="Título (opcional)" 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '14px', outline: 'none', fontWeight: 'bold' }} 
          />
          <textarea 
            name="content" 
            placeholder="¿Qué estás viendo?" 
            required 
            style={{ width: '100%', height: '90px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '13px', outline: 'none', resize: 'none', lineHeight: '1.5' }} 
          />
          <select 
            name="category" 
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '12px', outline: 'none' }}
          >
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          {previewUrl ? (
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
              <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} alt="p" />
              <button 
                type="button" 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} 
                style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <label style={{ padding: '16px', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontSize: '11px', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ImageIcon size={16} /> Añadir foto
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          )}
          
          <button 
            type="submit" 
            disabled={createLoading} 
            className="btn-primary" 
            style={{ padding: '13px', borderRadius: '12px', fontWeight: 'bold', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {createLoading ? 'SUBIENDO...' : 'PUBLICAR'}
          </button>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

export default CreatePostModal;
