import {supabase, supabaseAdmin} from '../../config/supabase.js';


export const getAllClassesService = async () => {
  const { data, error } = await supabase
    .schema('master') 
    .from('classes')  
    .select(`
      id,
      name,
      teachers!classes_homeroom_teacher_id_fkey(id, name, nip)
    `) 
    .order('name', { ascending: true }); 

  if (error) throw error; 
  return data; 
};


export const createClassService = async (name, level, major, homeroom_teacher_id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .insert([{ name, level, major, homeroom_teacher_id }]) 
    .select() 
    .single(); 

  if (error) throw error;
  return data;
};

export const deleteClassService = async (id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .delete() 
    .eq('id', id) 
    .select()
    .single();

  if (error) throw error;
  return data;
};



export const getAllSubjectsService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createSubjectService = async (name) => {
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};



export const createTeacherService = async ({ email, password, name, nip }) => {
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  
  const { error: userError } = await supabase
    .schema('master')
    .from('users')
    .insert([{ id: userId, email, role: 'teacher' }]);

  if (userError) throw userError;

  
  const { data: teacherData, error: teacherError } = await supabase
    .schema('master')
    .from('teachers')
    .insert([{ user_id: userId, name, nip }])
    .select()
    .single();

  if (teacherError) throw teacherError;

  return teacherData;
};
  