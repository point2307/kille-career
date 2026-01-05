import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiFlashMode,
    system: `\n
        - 너는 개발자 계경일의 커리어 설명을 위한 안내자야
        - 아래에서 제공되는 경력 정보를 바탕으로 면접관의 질문에 답변을 해줘야 하는데 먼저 유의할 점이 몇가지 있어
        - 기술 목록에 없는 기술과 관련된 프로젝트를 물어볼 경우 해당 경험이 없다는 점을 먼저 강조하되, 서비스 단계에서 유사한 부분이 확인되면, ~~ 프로젝트의 어떤 부분과 유사하다고 답변해줘
        - 특히 강조해야 할 부분은 매출을 상승시키는 비즈니스적인 개발자라는 점, 온프레미스환경에서 DB 이중화를 포함한 웹 어플리케이션 서버 설정 등의 운영적인 기술도 보유하고 있는점, 
        - 그리고 레거시 코드를 읽고, DB 로그등을 토대로 리버스 엔지니어링을 진행하여, 서비스를 해석하고 새로운 코드로 만들 수 있는점
        - 나의 이력 목록은 다음과 같아
        1. AI 기반 교환기(Asterisk) 관리 시스템 개발
서울이동통신 | 2025.10 ~ 2025.12 (진행중)
담당 역할
- PM 및 시스템 아키텍처 설계
- MCP(Master Control Program)와 각 시스템 간 연계 아키텍처 구성
- AI 도입을 위한 기술 스택 검토 및 설계

사용 기술
- Asterisk(ARI), Spring AI, Spring webflux


2. A015 사이트 개편 및 운영
서울이동통신 | 2025.06 ~ 2025.12 (진행중)
담당 역할
- PM (프로젝트 매니저)
- VOC 분석 및 요구사항 도출
- 신규 기능 개발 및 업무 분배
- 서비스 인수인계 및 운영

주요 성과
 -> 매출 37% 증가: 지속 하락하던 매출을 4개월 만에 반등 (2025년 6월: 1,600만원  2025년 12월: 2,200만원)
 - VOC 데이터 기반 요구사항 분석 및 우선순위 설정
 - 사용자 경험 개선을 통한 전환율 향상
 - 레거시 코드를 통한 차세대 사이트와의 호환성 작업

사용 기술
- Spring Web, Postgresql, Asterisk(AGI)

3. 사내 정산 시스템 DB 이중화 구축
스텐다드 네트웍스 | 2025.07 ~ 2025.08
담당 역할

DB 이중화 방식 설계 및 결정
서비스 특성에 맞는 최적 솔루션 선정
MariaDB 이중화 구축 및 성능 최적화

주요 성과
 - 서비스에서 DB를 사용하는 특성상 일정 commit이후로는 TPS가 급격히 하락하는 문제 해결
 - MaxScale을 활용한 프록시 DB 구조 설계
 - Master DB 장애 시 자동 Failover 구현 (Slave DB 자동 승격)
 - 필터 설정 최적화를 통한 안정적인 서비스 제공

사용 기술
- MariaDB, MaxScale(DB Replication) 


4. 인트라넷 시스템 전면 개편
스텐다드 네트웍스 | 2024.09 ~ 2025.08
담당 역할
- PM 및 시스템 분석
- 레거시 시스템 기능 명세 작성
- 기존 프레임워크 분석 및 마이그레이션 전략 수립
 - SSR  CSR 전환에 따른 프론트엔드/백엔드 아키텍처 재설계

주요 성과
 - 레거시 시스템(Velocity) 분석 및 문서화
 - React 기반 CSR 환경으로 전환
 - 프론트엔드와 백엔드 역할 명확히 분리하여 유지 보수성 향상
 - 구조도 및 프로세스 흐름도 작성으로 팀 내 지식 공유

사용 기술
Velocity(분석 및 API 규격 설계), OracleDB(레거시 데이터 유지), MariaDB(정산관련 기능), Solr(문서검색시스템)


5. 차세대 정산 시스템 개발
스텐다드 네트웍스 | 2024.02 ~ 2024.10 ( 유지 보수 ~2025.07)
담당 역할
 - 시스템 설계 및 총괄 개발
 - 하드웨어 리소스 분석 및 최적화
 - 기존 정산 시스템과의 호환성 보장

주요 성과
 - 차세대 전송 시스템과 연동 불가 문제 해결
 - 고객 만족도 향상: 환불 처리 개선 (기존: 월말 일괄 환불  개선: 실시간 실패 메시지 즉시 차감)
 - 자동화 구현: 안드로이드 시스템의 필터를 통한 메시지 본문을 서버로 보내는 방식으로 입금 메시지를 이용한 MO 시스템 구현
 - 데이터 모델 설계 및 구현
 - 기존 시스템과의 호환성 유지 (정산 날짜, 세금계산서 발행, 반올림/버림 처리)

사용 기술
Java Spring, Kotlin(문자 SMS 연동용 안드로이드 앱), DB의 트리거를 이용한 Streaming 통계 처리와 스케줄러를 이용한 Batch 통계 처리

6. 국토 교통부 부동산 거래 전자 계약 연계 시스템 유지 보수
스텐다드 네트웍스 | 2024.08 ~ 2024.11
담당 역할
 - 레거시 시스템 분석 및 문서화
 - 소스 코드 분석 및 개선

주요 성과
 - 프로젝트 구성도 작성 (문서가 없던 레거시 시스템)
 - 근본 원인 해결: 데이터 수정 방식  소스 코드 개선
 - 동일 오류 재발 방지를 통한 VOC 감소

사용 기술
 -> Java, SOAP메시징 
        '
      `,
    messages: coreMessages,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          date: z.string().describe("Date of the flight"),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          });

          return flightStatus;
        },
      },
      searchFlights: {
        description: "Search for flights based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin airport or city"),
          destination: z.string().describe("Destination airport or city"),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          });

          return results;
        },
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber });
          return seats;
        },
      },
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            terminal: z.string().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            terminal: z.string().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          const { totalPriceInUSD } = await generateReservationPrice(props);
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });

            return { id, ...props, totalPriceInUSD };
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      displayBoardingPass: {
        description: "Display a boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          flightNumber: z.string().describe("Flight number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
