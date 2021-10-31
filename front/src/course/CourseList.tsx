import CourseView from "./CourseView";
import React from "react";
import {observer} from "mobx-react-lite";
import {Course} from "../store";

export interface CourseListProps {
    courses: Course[] | undefined;
}

export default observer(function CourseList({ courses }: CourseListProps) {
    return <>
        {!!courses ? (
            courses.length === 0 ? (
                "Aucun cours"
            ) : (
                courses.map(c => (
                    <CourseView key={c.id} course={c}/>
                ))
            )
        ) : (
            <CourseView key="_" course={undefined}/>
        )}
    </>;
});
