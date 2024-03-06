import { SSL } from "@/components/Provider/http";
import SvelteJSONEditor from "@/components/TypeDefinition/Json/vanilla/VanillaJSONEditor.tsx";
import { Badge, Button, Card, List, Popover, Tag } from "antd";
import forge from "node-forge";
import { useEffect, useState } from "react";

export const SSLPanel = (props: { ssl: SSL }) => {
  const [ssl, setSSL] = useState(props.ssl);
  const [certs, setCerts] = useState([]);
  useEffect(() => {
    const certs = [];
    for (const cert of ssl.peerCertificates || []) {
      try {
        const pemCertificateString = `-----BEGIN CERTIFICATE-----\n${cert.encoded}\n-----END CERTIFICATE-----`;
        const certificate = forge.pki.certificateFromPem(pemCertificateString);
        certs.push(certificate);
      } catch (err) {
        console.log(err);
      }
    }
    setCerts([...certs]);
  }, [ssl, props.ssl]);

  return (
    <div>
      <List
        dataSource={certs}
        renderItem={(item, index) => {
          item.extensions
            .filter((ext) => ext.name === "subjectAltName")
            .map((ext) => {
              return (
                <Tag>{`${ext.name}=${ext.altNames
                  .map((altName) => altName.value)
                  .join(",")}`}</Tag>
              );
            });
          return (
            <Badge.Ribbon
              text={index + 1}
              style={{
                right: "10px",
              }}
            >
              <Card size={"small"} type={"inner"}>
                {item.extensions
                  .filter((ext) => ext.name === "subjectAltName")
                  .map((ext) => {
                    return (
                      <Tag>{`${ext.name}=${ext.value};altName=${ext.altNames
                        .map((altName) => altName.value)
                        .join(",")}`}</Tag>
                    );
                  })}
                {item.subject.attributes.map((attr) => {
                  return <Tag>{`${attr.name}=${attr.value}`}</Tag>;
                })}
                <Popover
                  trigger={"click"}
                  content={
                    <div
                      style={{
                        width: "800px",
                        height: "400px",
                        overflow: "auto",
                      }}
                    >
                      <SvelteJSONEditor
                        content={{ json: JSON.parse(JSON.stringify(item)) }}
                      />
                    </div>
                  }
                >
                  <Button>查看</Button>
                </Popover>
              </Card>
            </Badge.Ribbon>
          );
        }}
      />
    </div>
  );
};
