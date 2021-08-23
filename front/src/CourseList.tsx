import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import {useApi} from "./Api";
import CourseView from "./CourseView";
import AddIcon from "@material-ui/icons/Add";

export default function CourseList() {
    const { courses, fetchCourses } = useApi();

    return (
        <>
            <div style={{ margin: '8px' }}>
                <Button
                    style={{ width: '100%' }}
                    disabled={!courses}
                    variant="outlined"
                    size="large"
                    startIcon={<AddIcon />}
                    to="/courses/new"
                    component={Link}
                >
                    Ajouter un cours
                </Button>
            </div>
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
        </>
    );
}
