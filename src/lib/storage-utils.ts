'use client';

/**
 * أداة ذكية لتحميل الملفات تدعم الصور والملفات بنوعيها.
 * تضمن تحميل الملف بالاسم الصحيح والامتداد المناسب.
 */
export async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل الوصول للملف');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // تحديد الامتداد بناءً على نوع الملف
    let extension = 'jpg';
    if (blob.type.includes('pdf')) extension = 'pdf';
    else if (blob.type.includes('png')) extension = 'png';
    
    link.download = `${fileName.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error };
  }
}
