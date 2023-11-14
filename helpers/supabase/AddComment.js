import { supabase } from "../../supabaseService";
const addComment = async (audioLink) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          { audio_link: audioLink },
        ]);
  
      if (error) {
        console.error('Error adding comment:', error.message);
      } else {
        console.log('Comment added successfully:', data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

export default addComment;