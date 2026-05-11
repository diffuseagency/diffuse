import { useMemo } from 'react';
import { useFirestoreCollection } from './cmsHooks';

export function useBusinessMetrics() {
  const { data: messages, loading: messagesLoading } = useFirestoreCollection<any>('messages');
  const { data: projects, loading: projectsLoading } = useFirestoreCollection<any>('projects');
  const { data: billing, loading: billingLoading } = useFirestoreCollection<any>('billing');

  const loading = messagesLoading || projectsLoading || billingLoading;

  const metrics = useMemo(() => {
    if (loading) return null;

    const leadsCount = messages.length;
    const activeProjects = projects.filter(p => p.status !== 'completed').length;
    const totalProjects = projects.length;
    
    // Revenue calculations
    const totalRevenue = billing
      .filter(b => b.status === 'paid')
      .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    
    const pendingRevenue = billing
      .filter(b => b.status === 'unpaid')
      .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

    // Closing rate relative to all projects vs all messages
    const closingRate = leadsCount > 0 ? (totalProjects / leadsCount) * 100 : 0;

    // Tickets
    const averageTicket = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    return {
      leadsCount,
      activeProjects,
      totalProjects,
      totalRevenue,
      pendingRevenue,
      closingRate,
      averageTicket,
      rawLeads: messages,
      rawProjects: projects,
      rawBilling: billing
    };
  }, [messages, projects, billing, loading]);

  return { metrics, loading };
}
