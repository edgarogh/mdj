import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import CourseView from "./CourseView";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import {useRootStore} from "./StoreProvider";
import {observer} from "mobx-react-lite";

export default observer(function CourseListScreen() {
    const store = useRootStore();

    const courses = store.courseStore.courses;

    return (
        <>
            <div style={{ margin: '8px' }}>
                <Button
                    style={{ width: '100%' }}
                    disabled={store.courseStore.isLoading}
                    variant="outlined"
                    size="large"
                    startIcon={<AddIcon />}
                    to="/courses/new"
                    component={Link}
                >
                    Ajouter un cours
                </Button>
            </div>
            {!store.courseStore.isLoading ? (
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
        </>
    );
});
