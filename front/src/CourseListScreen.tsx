import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import CourseList from "./CourseList";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import {useRootStore} from "./StoreProvider";
import {observer} from "mobx-react-lite";

export default observer(function CourseListScreen() {
    const { courseStore } = useRootStore();

    const courses = courseStore.courses;

    return (
        <>
            <div style={{ margin: '8px' }}>
                <Button
                    style={{ width: '100%' }}
                    disabled={courseStore.isLoading}
                    variant="outlined"
                    size="large"
                    startIcon={<AddIcon />}
                    to="/courses/new"
                    component={Link}
                >
                    Ajouter un cours
                </Button>
            </div>
            <CourseList courses={courseStore.isLoading ? undefined : courses}/>
        </>
    );
});
