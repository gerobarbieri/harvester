import type { FC } from "react";
import Card from "../../commons/Card";
import Select from "../../commons/form/Select";



const Filters: FC = () => (
    <Card>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 lg:col-span-1">
                <Select label="Campaña" items={[]} name="campana" placeholder="Seleccionar Campaña" value="todos" onChange={() => { }} />
            </div>
            <div className="col-span-1">
                <Select label="Campo" items={[]} name="campo" placeholder="Campo" value="todos" onChange={() => { }} />
            </div>
            <div className="col-span-1">
                <Select label="Cultivo" items={[]} name="cultivo" placeholder="Cultivo" value="todos" onChange={() => { }} />
            </div>
        </div>
    </Card>
);

export default Filters;