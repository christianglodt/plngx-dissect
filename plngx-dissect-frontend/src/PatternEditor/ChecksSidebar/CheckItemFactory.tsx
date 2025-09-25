import React from "react";

import { Check, CheckTypeId, NumPagesCheck, RegionCheck, TitleRegexCheck, CorrespondentCheck, StoragePathCheck, DocumentTypeCheck, TagCheck, DateCreatedCheck, AndCheck, OrCheck, NotCheck } from "../../types";
import NumPagesCheckItem from "./CheckItems/NumPagesCheckItem";
import RegionCheckItem from "./CheckItems/RegionCheckItem";
import TitleRegexCheckItem from "./CheckItems/TitleRegexCheckItem";
import CorrespondentCheckItem from "./CheckItems/CorrespondentCheckItem";
import DocumentTypeCheckItem from "./CheckItems/DocumentTypeCheckItem";
import StoragePathCheckItem from "./CheckItems/StoragePathCheckItem";
import TagCheckItem from "./CheckItems/TagCheckItem";
import DateCreatedCheckItem from "./CheckItems/DateCreatedCheckItem";
import AndCheckItem from "./CheckItems/AndCheckItem";
import { CheckItemPropsType } from "./CheckItems/types";
import OrCheckItem from "./CheckItems/OrCheckItem";
import NotCheckItem from "./CheckItems/NotCheckItem";

const CheckItemFactory = (props: CheckItemPropsType<Check>): React.JSX.Element => {
    switch (props.check.type) {
        case CheckTypeId.NumPages:
            return <NumPagesCheckItem      {...props as CheckItemPropsType<NumPagesCheck>}/>;
        case CheckTypeId.Region:
            return <RegionCheckItem   {...props as CheckItemPropsType<RegionCheck>}/>;
        case CheckTypeId.Title:
            return <TitleRegexCheckItem    {...props as CheckItemPropsType<TitleRegexCheck>}/>;
        case CheckTypeId.Correspondent:
            return <CorrespondentCheckItem {...props as CheckItemPropsType<CorrespondentCheck>}/>;
        case CheckTypeId.DocumentType:
            return <DocumentTypeCheckItem  {...props as CheckItemPropsType<DocumentTypeCheck>}/>;
        case CheckTypeId.StoragePath:
            return <StoragePathCheckItem   {...props as CheckItemPropsType<StoragePathCheck>}/>;
        case CheckTypeId.Tag:
            return <TagCheckItem           {...props as CheckItemPropsType<TagCheck>}/>;
        case CheckTypeId.DateCreated:
            return <DateCreatedCheckItem   {...props as CheckItemPropsType<DateCreatedCheck>}/>;
        case CheckTypeId.And:
            return <AndCheckItem           {...props as CheckItemPropsType<AndCheck>}  factory={CheckItemFactory}/>;
        case CheckTypeId.Or:
            return <OrCheckItem            {...props as CheckItemPropsType<OrCheck>}   factory={CheckItemFactory}/>;
        case CheckTypeId.Not:
            return <NotCheckItem            {...props as CheckItemPropsType<NotCheck>} factory={CheckItemFactory}/>;
        default:
            throw new Error("Unsupported CheckTypeId");
    }
};

export default CheckItemFactory;
