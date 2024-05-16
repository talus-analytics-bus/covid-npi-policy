import React from "react";
import { useEffect } from "react";
import { AmpPage } from "types";

const useSetPageAndDisableLoading = (
  setPage: SetPage,
  setLoading: SetLoading
) => {
  useEffect(() => {
    setPage("policycoverage");
    setLoading(false);
  });
};

type SetPage = React.Dispatch<React.SetStateAction<AmpPage | null>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;

interface PolicyCoverageProps {
  setPage: SetPage;
  setLoading: SetLoading;
}

const PolicyCoverage = ({ setPage, setLoading }: PolicyCoverageProps) => {
  useSetPageAndDisableLoading(setPage, setLoading);

  return <h1>Policy Coverage Map Page</h1>;
};

export default PolicyCoverage;
