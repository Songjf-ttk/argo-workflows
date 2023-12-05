package main

import (
	"context"
	"fmt"
	"log"

	"github.com/argoproj/argo-workflows/v3/pkg/apiclient/workflow"
	"google.golang.org/grpc"
)

func main() {
	// 创建 gRPC 连接
	conn, err := grpc.Dial("localhost:2746", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("无法连接到 Argo 服务：%v", err)
	}
	defer conn.Close()

	// 创建Argo的WorkflowService客户端
	client := workflow.NewWorkflowServiceClient(conn)

	// 创建一个上下文
	ctx := context.Background()

	// 获取工作流状态
	resp, err := client.ListWorkflows(ctx, &workflow.WorkflowListRequest{})
	if err != nil {
		fmt.Println("获取工作流列表失败:", err)
		return
	}

	// 处理工作流列表
	for _, wf := range resp.Items {
		fmt.Printf("工作流名称：%s，状态：%s\n", wf.ObjectMeta.Name, wf.Status.Phase)
	}
}
