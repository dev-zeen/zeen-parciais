import { useGetMatchSubstitutions } from '@/queries/club.query';

type SubstituitionsProps = {
  teamId?: number;
};

const useSubstituition = ({ teamId }: SubstituitionsProps) => {
  const {
    data: substitutions,
    isLoading: isLoadingSubstitutions,
    refetch: onRefetchSubstitutions,
    isRefetching: isRefetchingSubstitutions,
  } = useGetMatchSubstitutions({
    id: teamId,
  });

  return {
    substitutions,
    isLoadingSubstitutions,
    onRefetchSubstitutions,
    isRefetchingSubstitutions,
  };
};

export default useSubstituition;
