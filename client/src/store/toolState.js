import { makeAutoObservable } from "mobx";

class ToolState{
    tool = null;
    color = 'black';

    constructor(){
        makeAutoObservable(this);
    }

    setTool(tool){
        this.tool = tool;
    }

    setFillColor(color){
        this.tool.fillColor = color;
    }

    setStrokeColor(color){
        this.tool.strokeColor = color;
        this.color = color;
    }

    setLineWidth(width){
        this.tool.lineWidth = width;
    }
}

export default new ToolState()