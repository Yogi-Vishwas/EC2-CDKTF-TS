// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { KeyPair } from "@cdktf/provider-aws/lib/key-pair";
import * as os from "os";
import * as fs from "fs";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const keyPath = os.homedir() + "/.ssh/id_rsa.pub";
    const publicKey = fs.readFileSync(keyPath, "utf-8");

    new AwsProvider(this, "AWS", {
      region: "ap-south-1",
    });

    const keyPairEC2 = new KeyPair(this, "keyPair", {
      publicKey,
      keyName: "CDKTF-KEY",
    });

    const instance = new Instance(this, "compute", {
      ami: "ami-0f8ca728008ff5af4",
      instanceType: "t2.micro",
      keyName: keyPairEC2.keyName,
    });

    new TerraformOutput(this, "public_ip", {
      value: instance.publicIp,
    });

    // define resources here
  }
}

const app = new App();
new MyStack(app, "cdktf-ts");
app.synth();
