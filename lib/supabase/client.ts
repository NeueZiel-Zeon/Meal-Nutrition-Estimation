'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// シングルトンインスタンスとして作成
const supabaseClient = createClientComponentClient();

export { supabaseClient }; 