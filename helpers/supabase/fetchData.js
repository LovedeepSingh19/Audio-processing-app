import { supabase } from "../../supabaseService";

const fetchData = async (setSupabaseList) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select();
  
      if (error) {
        console.error('Error fetching data:', error.message);
      } else {
        console.log('Data fetched successfully:', data);
        setSupabaseList(data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

export default fetchData