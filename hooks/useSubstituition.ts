import { useGetMatchSubstitutions } from '@/queries/club.query';

type SubstituitionsProps = {
  teamId?: number;
  round?: number;
};

const useSubstituition = ({ teamId, round }: SubstituitionsProps) => {
  const {
    data: substitutions,
    isLoading: isLoadingSubstitutions,
    refetch: onRefetchSubstitutions,
    isRefetching: isRefetchingSubstitutions,
  } = useGetMatchSubstitutions({
    id: teamId,
    round,
  });

  return {
    substitutions,
    isLoadingSubstitutions,
    onRefetchSubstitutions,
    isRefetchingSubstitutions,
  };
};

export default useSubstituition;
