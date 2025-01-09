import type { APIRoute } from 'astro';
import { getCollection } from "astro:content";
import { sortByDate } from "@/lib/utils/sortFunctions";
import config from "@/config/config.json";

export const GET: APIRoute = async ({ url }) => {
  try {
    const cases = await getCollection("cases");
    const sortedCases = cases.sort((a, b) => {
      const numA = parseInt(a.id.split('-')[1]);
      const numB = parseInt(b.id.split('-')[1]);
      return numA - numB;
    });
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category') || 'All';
    const { pagination } = config.settings;
    
    // 根据分类过滤
    const filteredCases = category === 'All' 
      ? sortedCases 
      : sortedCases.filter(item => item.data.category === category);
    
    const start = (page - 1) * pagination;
    const end = start + pagination;
    
    const slicedCases = filteredCases.slice(start, end);
    console.log('API sending cases:', slicedCases.map(c => c.id));
    
    return new Response(JSON.stringify({
      cases: slicedCases,
      page,
      totalPages: Math.ceil(filteredCases.length / pagination)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load cases' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 