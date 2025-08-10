import type { FC } from "react";
import Select from "../commons/form/Select";
import Card from "../commons/Card";




const Filters: FC = () => (
    <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Campo" items={[]} name="campo" placeholder="Filtrar por Campo" />
        </div>
    </Card>
);

export default Filters;