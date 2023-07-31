import { MATCHES_ACTUAL_ROUND } from "@/constants/Endpoits";
import { Matches } from "@/models/Matches";
import { useFetch } from "@/utils/reactQuery";

export const useGetMatchs = () => useFetch<Matches>(MATCHES_ACTUAL_ROUND);
